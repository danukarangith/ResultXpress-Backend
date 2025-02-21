import XLSX from 'xlsx';
import prisma from '../config/db'; // Assuming you have a Prisma client instance exported from db

// Define the expected structure of the result
interface Result {
    studentId: string;
    subject: string;
    marks: number;
    semester: string; // Add semester to match your Prisma schema
}

export const uploadResults = async (filePath: string) => {
    const workbook = XLSX.readFile(filePath);
    const sheetNameList = workbook.SheetNames;
    const results: Result[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

    for (let result of results) {
        const { studentId, subject, marks, semester } = result;
        // Ensure all required fields are provided (including semester)
        await prisma.result.create({
            data: {
                studentId,
                subject,
                marks,
                semester,  // Add semester to the data being inserted
            },
        });
    }
};
