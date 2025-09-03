import tkinter as tk
from tkinter import ttk, messagebox, filedialog, scrolledtext
from styling import AppStyler
from file_utils import read_uploaded_file
from ai_utils import generate_summary, ask_question, send_author_reflection_prompt, analyze_intent_deviation, analyze_market_trend, generate_marketing_plan
from gui_components import create_main_frame, create_tab2_content, create_marketing_tab
from fpdf import FPDF
from fpdf.enums import XPos, YPos
import os

uploaded_text = {"content": ""}
styler = AppStyler()

EXPORT_TXT = "book_analysis_output.txt"
EXPORT_PDF = "book_analysis_output.pdf"

with open(EXPORT_TXT, "w", encoding="utf-8") as file:
    file.write("")

class PDFExporter(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 14)
        self.cell(0, 10, "Book Analysis Report", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        self.ln(10)

    def chapter_title(self, title):
        self.set_font("helvetica", "B", 12)
        self.set_text_color(0)
        self.cell(0, 10, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        self.ln(5)

    def chapter_body(self, body):
        self.set_font("helvetica", "", 11)
        self.multi_cell(0, 10, body)
        self.ln()

    def add_analysis(self, title, body):
        self.chapter_title(title)
        self.chapter_body(body)

def save_titled_analysis_to_txt(title: str, body: str):
    with open(EXPORT_TXT, "a", encoding="utf-8") as file:
        file.write(f"### {title} ###\n{body}\n\n")

def export_to_pdf():
    if not os.path.exists(EXPORT_TXT):
        return

    with open(EXPORT_TXT, "r", encoding="utf-8") as file:
        content = file.read()

    pdf = PDFExporter()
    pdf.add_page()

    entries = content.strip().split("### ")
    for entry in entries:
        if entry.strip():
            parts = entry.strip().split("###", 1)
            section_title = parts[0].strip()
            section_body = parts[1].strip() if len(parts) > 1 else ""
            pdf.add_analysis(section_title, section_body)

    pdf.output(EXPORT_PDF)

def show_upload_popup(root):
    popup = tk.Toplevel(root)
    popup.title("Upload Manuscript")
    popup.geometry("400x200")
    popup.transient(root)
    popup.grab_set()
    styler.apply_theme(popup)

    ttk.Label(popup, text="Please upload your manuscript (.txt or .pdf):", font=styler.label_config(size=12)).pack(pady=20)
    file_label = ttk.Label(popup, text="No file selected", font=styler.label_config(size=10))
    file_label.pack()

    def handle_upload():
        file_path = filedialog.askopenfilename(filetypes=[("Text files", "*.txt"), ("PDF files", "*.pdf")])
        if file_path:
            uploaded_text["content"] = read_uploaded_file(file_path)
            file_label.config(text=f"Uploaded: {file_path.split('/')[-1]}", foreground="green")
            popup.destroy()
        else:
            messagebox.showwarning("No File", "Please select a file to continue.")

    ttk.Button(popup, text="Browse File", command=handle_upload, style="Accent.TButton").pack(pady=10)
    root.wait_window(popup)

# App Setup
root = tk.Tk()
root.title("AI Book Assistant")
root.state('zoomed')
root.resizable(True, True)

styler.apply_theme(root)

# Show upload popup first
show_upload_popup(root)

# load the notebook tabs
notebook = ttk.Notebook(root)
notebook.pack(fill='both', expand=True)

tab1 = ttk.Frame(notebook)
tab2 = ttk.Frame(notebook)
tab3 = ttk.Frame(notebook)
tab4 = ttk.Frame(notebook)
notebook.add(tab1, text="Summarizer")
notebook.add(tab2, text="Author Reflection")
notebook.add(tab3, text="Marketing Analysis")
notebook.add(tab4, text="Export")

def insert_prompt(prompt_text):
    question_entry.delete(0, tk.END)
    question_entry.insert(0, prompt_text)

def handle_feedback_yes(root):
    feedback_window = tk.Toplevel(root)
    feedback_window.title("Describe Errors")
    feedback_label = ttk.Label(feedback_window, text="Please describe the errors:")
    feedback_label.pack(padx=10, pady=10)
    feedback_entry = scrolledtext.ScrolledText(feedback_window, wrap=tk.WORD, width=60, height=5,
                                               font=styler.font_config(), bg="#1e1e1e", fg="#FFFFFF")
    feedback_entry.pack(padx=10, pady=5)
    submit_feedback_button = ttk.Button(feedback_window, text="Submit Feedback",
                                        command=lambda: submit_feedback(feedback_entry.get("1.0", tk.END).strip(), feedback_window))
    submit_feedback_button.pack(pady=10)

def submit_feedback(feedback_text, feedback_window):
    if not feedback_text:
        messagebox.showinfo("Error", "Please describe the errors before submitting.")
        return
    messagebox.showinfo("Feedback Sent", "Thank you for your feedback. We will strive to improve!")
    feedback_window.destroy()

main_frame, _, blurb_text, result_text, question_entry = create_main_frame(
    tab1, root, styler, generate_summary, ask_question, insert_prompt, uploaded_text)

upload_frame_tab2, _, author_intent_var, intended_entry, ai_interpretation_text, analysis_result_text = create_tab2_content(
    tab2, root, styler, send_author_reflection_prompt, analyze_intent_deviation, handle_feedback_yes, uploaded_text)

create_marketing_tab(
    tab3, root, styler, uploaded_text, analyze_market_trend, generate_marketing_plan)

def setup_export_tab(tab):
    lbl = tk.Label(tab, text="Download your complete analysis:", font=("helvetica", 12))
    lbl.pack(pady=10)

    btn_txt = tk.Button(tab, text="Download .TXT", command=lambda: os.system(f'open {EXPORT_TXT}'))
    btn_txt.pack(pady=5)

    btn_pdf = tk.Button(tab, text="Download .PDF", command=lambda: os.system(f'open {EXPORT_PDF}'))
    btn_pdf.pack(pady=5)

setup_export_tab(tab4)
export_to_pdf()

root.mainloop()
