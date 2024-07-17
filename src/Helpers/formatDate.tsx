export const formatDate = (inputDate: any) => {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.getMonth(); // Month indexes are zero-based
    const year = date.getFullYear();

    // Array of month names
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "Mai", "Jun",
        "Jul", "Aug", "Sep", "Okt", "Nov", "Des"
    ];

    const formattedDay = day; // No need to pad day with leading zeros
    const formattedMonth = monthNames[month];

    return `${formattedDay}. ${formattedMonth} ${year}`;
};