
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel, Footer } from "docx";
import saveAs from "file-saver";
import { LessonPlan } from "../types";

export const exportToWord = async (plans: LessonPlan[]) => {
  const baseRunOptions = { font: "Times New Roman", size: 26, color: "000000" };

  // Sort by week
  const sortedPlans = [...plans].sort((a, b) => {
    const weekA = parseInt(a.tuan.replace(/\D/g, '')) || 0;
    const weekB = parseInt(b.tuan.replace(/\D/g, '')) || 0;
    return weekA - weekB;
  });

  const tableHeaderCell = (text: string, width: number) => new TableCell({
    shading: { fill: "F1F5F9" },
    width: { size: width, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ 
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, ...baseRunOptions })] 
    })],
  });

  const chapterRow = (title: string) => new TableRow({
    children: [
      new TableCell({
        shading: { fill: "1D4ED8" },
        columnSpan: 5,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: title.toUpperCase(), bold: true, color: "FFFFFF", font: "Times New Roman", size: 28 })]
        })]
      })
    ]
  });

  const lessonRow = (p: LessonPlan) => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p.stt, ...baseRunOptions })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: p.tuan, ...baseRunOptions })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: p.tenBai, bold: true, ...baseRunOptions })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: p.noiDung, ...baseRunOptions })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: p.nls, color: "1D4ED8", italics: true, ...baseRunOptions })] })] }),
    ]
  });

  const tableRows: TableRow[] = [
    new TableRow({
      children: [
        tableHeaderCell("STT", 5),
        tableHeaderCell("Tuần", 10),
        tableHeaderCell("Tên Bài", 30),
        tableHeaderCell("Nội Dung Đảm Bảo", 30),
        tableHeaderCell("Năng Lực Số (NLS)", 25),
      ],
    })
  ];

  let currentChapter = "";
  sortedPlans.forEach(p => {
    if (p.chuong && p.chuong !== currentChapter) {
      currentChapter = p.chuong;
      tableRows.push(chapterRow(currentChapter));
    }
    tableRows.push(lessonRow(p));
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new TextRun({ 
              text: "KẾ HOẠCH BÀI DẠY LỒNG GHÉP NĂNG LỰC SỐ", 
              bold: true, 
              size: 32, 
              font: "Times New Roman" 
            })
          ]
        }),
        table
      ],
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Create by Hoà Hiệp AI – 0983.676.470",
                  italics: true,
                  color: "888888",
                  size: 22,
                  font: "Times New Roman"
                })
              ]
            })
          ]
        })
      }
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "KHBD_NLS_HoaHiepAI.docx");
};
