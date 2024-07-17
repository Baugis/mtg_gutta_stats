// Function to check if a deck is retired
export const checkRetired = (record: any) => {
    if (record.retired) {
        return true;
    }

    return false;
}