import XLSX from 'xlsx';
import prisma from '../config/db'; // Assuming you have a Prisma client instance exported from db

// Define the expected structure of the result
interface Result {
    studentId: string;
    subject: string;
    marks: number;
    semester: string;
    date?: string | number;  // Date is optional and could be a string or number
}

// Function to convert Excel date serial number to JavaScript Date
const excelDateToJSDate = (serial: number): Date => {
    const epoch = new Date(Date.UTC(1899, 11, 30)); // Excel's epoch starts at 1899-12-30
    const millisecondsInDay = 86400000;
    return new Date(epoch.getTime() + serial * millisecondsInDay);
};

export const uploadResults = async (filePath: string) => {
    const workbook = XLSX.readFile(filePath);
    const sheetNameList = workbook.SheetNames;
    const results: Result[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

    for (let result of results) {
        const { studentId, subject, marks, semester, date } = result;

        // If 'date' exists and is in Excel's numeric date format (serial), convert it to JavaScript Date
        let parsedDate = date ?
            (typeof date === 'number' ? excelDateToJSDate(date) : new Date(date))
            : new Date(); // Use current date if 'date' is not available

        // Ensure the parsed date is a valid Date and adjust it to UTC
        if (isNaN(parsedDate.getTime())) {
            console.log(`Invalid date for student ${studentId}. Using current date.`);
            parsedDate = new Date(); // Default to current date if invalid
        }

        // To ensure the date is saved as UTC (no timezone shift)
        const utcDate = new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));

        // Insert data into the database
        await prisma.result.create({
            data: {
                studentId,
                subject,
                marks,
                semester,
                date: utcDate, // Insert the date in UTC format
            },
        });
    }
};
