export const calculateGPA = (results: any[]) => {
    const totalMarks = results.reduce((acc, result) => acc + result.marks, 0);
    const gpa = totalMarks / results.length;
    return gpa.toFixed(2);
};
