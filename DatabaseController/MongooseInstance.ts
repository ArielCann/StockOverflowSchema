import mongoose from 'mongoose';
/**
 * this method is responsible for connecting the current mongo db isntance to mongoose
 * @param dbURI 
 */
const connectToMongoDB = async (dbURI: string): Promise<void> => {
    try {
        await mongoose.connect(dbURI, {});
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};
/**
 * this method is responsible for disconnecting the current mongo db isntance to mongoose
 */
const disconnectFromMongoDB = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
};

export { connectToMongoDB, disconnectFromMongoDB };