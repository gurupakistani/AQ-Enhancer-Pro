// A simple singleton queue to process async tasks one by one with a delay.
// This is the core solution to prevent API rate-limiting.
type AsyncTask = () => Promise<any>;

const queue: AsyncTask[] = [];
let isProcessing = false;

// The delay between processing tasks in milliseconds.
// This is the key to avoiding rate limits on shared platforms.
const PROCESSING_DELAY_MS = 3500; 

const processQueue = async () => {
    if (queue.length === 0) {
        isProcessing = false;
        return;
    }

    isProcessing = true;
    const task = queue.shift();

    if (task) {
        try {
            await task();
        } catch (error) {
            console.error("A task in the queue failed:", error);
            // Error handling (e.g., updating UI state) is managed within the task itself.
        }
    }
    
    // Wait for the mandatory delay before processing the next item.
    setTimeout(processQueue, PROCESSING_DELAY_MS);
};

export const requestQueue = {
    /**
     * Adds a new async task to the queue. The task will be executed
     * when all previous tasks are complete and after the mandatory delay.
     * @param task An async function that performs the API call.
     */
    add: (task: AsyncTask) => {
        queue.push(task);
        if (!isProcessing) {
            processQueue();
        }
    },
    /**
     * Clears all pending tasks from the queue.
     */
    clear: () => {
        queue.length = 0;
    },
    /**
     * Gets the number of tasks currently waiting in the queue.
     */
    get length() {
        return queue.length;
    }
};
