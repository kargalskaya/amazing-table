import chalk from "chalk";
import stripAnsi from "strip-ansi";

module.exports = (options, data) => {
  let columns;
  if (options.columns) {
    columns = options.columns;
  } else {
    columns = [];
    data.forEach((e) =>
      Object.keys(e)
        .filter((k) => {
          return columns.indexOf(k) === -1;
        })
        .forEach((k) => {
          columns.push(k);
        })
    );
  }
  columns = columns.map((e) => {
    if (typeof e === "string") {
      e = {
        name: e,
        field: e,
      };
    }

    e.name = chalk.bold(e.name);
    e.width = stripAnsi(e.name).length;

    return e;
  });
  function findMaxLength(arr) {
    return arr.reduce((a, b) =>
      stripAnsi(a.toString()).length > stripAnsi(b.toString()).length ? a : b
    ).length;
  }
  let firstRow = ["╭"];
  let lastRow = ["╰"];
  let terminateRow = ["├"];
  let titleRow = ["│"];
  let content = [];
  let colLen = [];
  let lenTitle = "";
  let lenValue = 1;

  columns.map((_, i) => {
    colLen.push(
      findMaxLength([
        columns[i].name,
        ...data.map((opt) => opt[columns[i].field]),
      ]) + 2
    );
    firstRow.push("─".repeat(colLen[i]));
    terminateRow.push("─".repeat(colLen[i]));
    lastRow.push("─".repeat(colLen[i]));
    if (colLen[i] === columns[i].width + 1) {
      lenTitle = columns[i].width - 1;
    }
    if (colLen[i] > columns[i].width + 1) {
      lenTitle = colLen[i] - columns[i].width - 1;
    }
    if (colLen[i] < columns[i].width + 1) {
      lenTitle = colLen[i] - columns[i].width - 1;
    }

    titleRow.push(" " + columns[i].name + " ".repeat(lenTitle));

    if (i < columns.length - 1) {
      firstRow.push("┬");
      terminateRow.push("┼");
      lastRow.push("┴");
      titleRow.push("│");
    }
    if (i === columns.length - 1) {
      firstRow.push("╮");
      terminateRow.push("┤");
      lastRow.push("╯");
      titleRow.push("│");
    }
  });

  firstRow = firstRow.join("") + "\n";
  terminateRow = terminateRow.join("") + "\n";
  lastRow = lastRow.join("") + "\n";
  titleRow = titleRow.join("") + "\n";

  data.map((str, i) => {
    let row = [];
    columns.map((col, j) => {
      if (colLen[j] === stripAnsi(str[col.field].toString()).length + 1) {
        lenValue = 0;
      }
      if (colLen[j] > stripAnsi(str[col.field].toString()).length + 1) {
        lenValue = colLen[j] - stripAnsi(str[col.field].toString()).length - 1;
      }
      row.push("│ " + str[col.field] + " ".repeat(lenValue));
      if (columns.length - 1 === j) {
        row = row.join("") + "|\n";
      }
    });

    if (i === data.length - 1) {
      row = row.concat(lastRow + "\n");
    }
    if (i < data.length - 1) {
      row = row.concat(terminateRow);
    }
    content.push(row);
  });

  content = firstRow
    .concat(titleRow)
    .concat(terminateRow)
    .concat(content.join(""));

  return content;
};
