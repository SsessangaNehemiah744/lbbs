require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Member = require('./models/Member');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lbbs';

const books = [
  { bookId: 'B001', title: 'Clean Code', author: 'Robert C. Martin', totalCopies: 3, genre: 'Programming', isbn: '9780132350884', description: 'A handbook of agile software craftsmanship.' },
  { bookId: 'B002', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', totalCopies: 2, genre: 'Programming', isbn: '9780135957059', description: 'Your journey to mastery in software development.' },
  { bookId: 'B003', title: 'Design Patterns', author: 'Gang of Four', totalCopies: 2, genre: 'Software Architecture', isbn: '9780201633610', description: 'Elements of reusable object-oriented software.' },
  { bookId: 'B004', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', totalCopies: 4, genre: 'Computer Science', isbn: '9780262046305', description: 'Comprehensive introduction to modern algorithms.' },
  { bookId: 'B005', title: 'You Don\'t Know JS', author: 'Kyle Simpson', totalCopies: 3, genre: 'Programming', isbn: '9781491924464', description: 'A deep dive into the core mechanisms of JavaScript.' },
  { bookId: 'B006', title: 'Refactoring', author: 'Martin Fowler', totalCopies: 2, genre: 'Programming', isbn: '9780134757599', description: 'Improving the design of existing code.' },
  { bookId: 'B007', title: 'The Mythical Man-Month', author: 'Frederick P. Brooks', totalCopies: 1, genre: 'Software Engineering', isbn: '9780201835953', description: 'Essays on software engineering.' },
  { bookId: 'B008', title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson', totalCopies: 2, genre: 'Computer Science', isbn: '9780262510875', description: 'A classic text in computer science education.' },
];

const members = [
  { memberId: 'M001', name: 'Alice Nakamura', email: 'alice@makerere.ac.ug', phone: '0701000001' },
  { memberId: 'M002', name: 'Bob Ochieng', email: 'bob@makerere.ac.ug', phone: '0701000002' },
  { memberId: 'M003', name: 'Carol Apio', email: 'carol@makerere.ac.ug', phone: '0701000003' },
  { memberId: 'M004', name: 'David Ssemakula', email: 'david@makerere.ac.ug', phone: '0701000004' },
  { memberId: 'M005', name: 'Eve Namukasa', email: 'eve@makerere.ac.ug', phone: '0701000005' },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Book.deleteMany({});
    await Member.deleteMany({});
    console.log('Cleared existing data');

    await Book.insertMany(books);
    console.log(`✅ Seeded ${books.length} books`);

    await Member.insertMany(members);
    console.log(`✅ Seeded ${members.length} members`);

    console.log('\nSeed data:');
    console.log('Books:', books.map((b) => `${b.bookId}: ${b.title}`).join('\n  '));
    console.log('Members:', members.map((m) => `${m.memberId}: ${m.name}`).join('\n  '));
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
  }
};

seed();
