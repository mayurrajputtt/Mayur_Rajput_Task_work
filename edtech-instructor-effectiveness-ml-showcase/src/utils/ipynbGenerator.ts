import { NOTEBOOK_SECTIONS } from '../data/notebookContent';
import { GOOGLE_SHEET_CSV_URL } from '../data/mockDataset';

/**
 * Generates a standard Jupyter Notebook (.ipynb) JSON string.
 * Formatted cleanly with metadata so Google Colab opens it with Python 3 syntax highlighting.
 */
export function generateIpynbFile(): string {
  const cells: any[] = [];

  // Add header markdown cell
  cells.push({
    cell_type: "markdown",
    metadata: {},
    source: [
      "# Data Science Internship Assignment Submission\n",
      "## Instructor Effectiveness Modeling (EdTech Context)\n",
      "---\n",
      "**Candidate**: Data Science Intern Candidate\n",
      "**Dataset Location**: `https://docs.google.com/spreadsheets/d/1PIVokMa_Mcgm1JJLC1IUx3fXZilTBAwzVUP-tqhZecY/edit?usp=sharing`\n",
      "**Allowed Libraries**: `python`, `pandas`, `numpy`, `matplotlib`, `seaborn`, `scikit-learn`\n",
      "---\n"
    ]
  });

  // Loop through all 16 sections and convert to Markdown + Code cells
  NOTEBOOK_SECTIONS.forEach((section) => {
    // Markdown cell
    const mdLines = section.markdown.split('\n').map(line => line + '\n');
    cells.push({
      cell_type: "markdown",
      metadata: {},
      source: [
        `## ${section.title}\n`,
        `**Key Takeaway**: *${section.keyTakeaway}*\n\n`,
        ...mdLines
      ]
    });

    // Code cell (if code exists)
    if (section.code && section.code.trim().length > 0) {
      const codeLines = section.code.split('\n').map((line, idx, arr) => 
        idx === arr.length - 1 ? line : line + '\n'
      );

      // Create simulated output for Colab offline preview
      const outputs: any[] = [];
      if (section.outputs && section.outputs.length > 0) {
        section.outputs.forEach(out => {
          if (out.type === 'text' || out.type === 'info' || out.type === 'describe') {
            outputs.push({
              name: "stdout",
              output_type: "stream",
              text: [
                `[OUT] ${out.title || 'Summary'}: ${out.summary || ''}\n`
              ]
            });
          }
        });
      }

      cells.push({
        cell_type: "code",
        execution_count: section.id,
        metadata: {
          colab: {
            base_uri: "https://localhost:8080/"
          }
        },
        outputs: outputs,
        source: codeLines
      });
    }
  });

  const ipynbStructure = {
    cells: cells,
    metadata: {
      colab: {
        provenance: []
      },
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3"
      },
      language_info: {
        codemirror_mode: {
          name: "ipython",
          version: 3
        },
        file_extension: ".py",
        mimetype: "text/x-python",
        name: "python",
        nbconvert_exporter: "python",
        pygments_lexer: "ipython3",
        version: "3.10.12"
      }
    },
    nbformat: 4,
    nbformat_minor: 5
  };

  return JSON.stringify(ipynbStructure, null, 2);
}

/**
 * Triggers a browser download of the generated .ipynb file
 */
export function downloadIpynb(): void {
  const jsonContent = generateIpynbFile();
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Instructor_Effectiveness_Modeling_Submission.ipynb');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data as a CSV file
 */
export function downloadCsv(data: any[], filename: string = 'instructor_dataset.csv'): void {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(','))
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
