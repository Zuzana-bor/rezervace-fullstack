import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        'mongodb+srv://admin:Lhota271@cluster0.b5foopv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    );
    console.log('MongoDB připojeno');
  } catch (error) {
    console.error('Chyba při připojení k MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
