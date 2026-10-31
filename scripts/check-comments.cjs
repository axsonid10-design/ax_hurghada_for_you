const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/components/expenses/ExpensesManagement.jsx',
  'src/components/expenses/AddExpenseModal.jsx',
  'src/components/expenses/AddCustodyModal.jsx',
  'src/components/expenses/CustodySettlementModal.jsx',
  'src/components/expenses/PrintDisbursementVoucherModal.jsx',
  'src/components/expenses/PrintCustodySettlementModal.jsx',
  'src/components/expenses/PrintPnlStatementModal.jsx',
  'src/utils/numberToWords.js',
  'src/store/useAXStore.js',
  'src/i18n/translations.js'
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const commentLines = [];
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) {
      commentLines.push({ line: i + 1, text: t });
    }
  });
  if (commentLines.length > 0) {
    console.log(`${file}: ${commentLines.length} comment lines`);
    console.log(commentLines.slice(0, 3));
  }
});
