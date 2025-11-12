const blob = new Blob([textContent], { type: "text/plain" });
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "ReaderAI_Report.txt";
link.click();
