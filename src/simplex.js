export default function calculate(objectiveValues, restrictions) {
  const result = [];
  let input = receiveInput(objectiveValues, restrictions);
  let matrix = deepCopy(input.steps[0].table);
  result.push(input);

  while (stopCondition(matrix)) {
    const { matrix: newMatrix, steps } = calcMatrix(deepCopy(matrix));
    result.push({ steps });
    matrix = newMatrix;
  }

  return result;
}

function deepCopy(array) {
  return JSON.parse(JSON.stringify(array));
}

function receiveInput(objectiveValues, restrictions) {
  const restrictionLines = addAdditionalVariables(restrictions);
  const newObjectiveLine = [
    ...objectiveValues,
    ...Array(restrictions.length + 1).fill(0),
  ];
  const table = [...restrictionLines, newObjectiveLine];

  return {
    steps: [
      {
        label: "",
        table,
      },
    ],
  };
}

function stopCondition(matrix) {
  let index = matrix.length - 1;
  for (let value of matrix[index]) {
    if (value > 0) return true;
  }

  return false;
}

function calcMatrix(matrix) {
  let steps = [];
  const numberOfLines = matrix.length;
  const numberOfColumns = matrix[0].length;

  // Determinar a variável básica que entra
  let lastRow = matrix[numberOfLines - 1];
  let columnEnteringIndex = 0;
  let maxValue = -Infinity;

  for (let j = 0; j < numberOfColumns - 1; j++) {
    if (lastRow[j] > maxValue) {
      maxValue = lastRow[j];
      columnEnteringIndex = j;
    }
  }

  // Determinar a variável básica que sai
  let rowLeavingIndex = -1;
  let minRatio = Infinity;

  for (let i = 0; i < numberOfLines - 1; i++) {
    const element = matrix[i][columnEnteringIndex];
    const rhs = matrix[i][numberOfColumns - 1];
    if (element > 0) {
      const ratio = rhs / element;
      if (ratio < minRatio) {
        minRatio = ratio;
        rowLeavingIndex = i;
      }
    }
  }

  if (rowLeavingIndex === -1) {
    throw new Error("Problema sem fronteira");
  }

  // Tornar o pivô igual a 1
  const pivot = matrix[rowLeavingIndex][columnEnteringIndex];
  for (let j = 0; j < numberOfColumns; j++) {
    matrix[rowLeavingIndex][j] /= pivot;
  }
  const labelNormalize = `Linha ${rowLeavingIndex} foi normalizada para tornar o pivô igual a 1.`;

  steps.push({
    label: labelNormalize,
    table: JSON.parse(JSON.stringify(matrix)),
  });

  // Zerando os outros valores na coluna da nova variável básica
  for (let i = 0; i < numberOfLines; i++) {
    if (i !== rowLeavingIndex) {
      const factor = matrix[i][columnEnteringIndex];
      for (let j = 0; j < numberOfColumns; j++) {
        matrix[i][j] -= factor * matrix[rowLeavingIndex][j];
      }
    }
  }

  const labelUpdate = `Outras linhas ajustadas para zerar a coluna ${columnEnteringIndex}.`;

  steps.push({
    label: labelUpdate,
    table: JSON.parse(JSON.stringify(matrix)),
  });

  return { matrix, steps };
}

const addAdditionalVariables = (input) => {
  const n = input.length;
  return input.map((subarray, i) => {
    let result = [...subarray];
    let added = Array(n).fill(0);
    added[i] = 1;
    result.splice(2, 0, ...added);
    return result;
  });
};
