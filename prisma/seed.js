import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const seedQuizs = [
  {
    "id": 1,
    "question": "Mikä on Suomen pääkaupunki?",
    "answer": "Helsinki"
  },
  {
    "id": 2,
    "question": "Mikä planeetta tunnetaan 'punaisena planeettana'?",
    "answer": "Mars"
  },
  {
    "id": 3,
    "question": "Kuinka monta bittiä on yhdessä tavussa?",
    "answer": "8"
  },
  {
    "id": 4,
    "question": "Kuka maalasi Mona Lisan?",
    "answer": "Leonardo da Vinci"
  },
  {
    "id": 5,
    "question": "Mikä on maailman suurin valtameri?",
    "answer": "Tyyni valtameri"
  },
  {
    "id": 6,
    "question": "Mihin alkuaineeseen kemiallinen merkki 'Au' viittaa?",
    "answer": "Kulta"
  },
  {
    "id": 7,
    "question": "Mikä on luvun 9 neliöjuuri?",
    "answer": "3"
  },
  {
    "id": 8,
    "question": "Missä maassa sijaitsevat Gizan pyramidit?",
    "answer": "Egypti"
  },
  {
    "id": 9,
    "question": "Mikä on ihmiskehon suurin elin?",
    "answer": "Iho"
  },
  {
    "id": 10,
    "question": "Minä vuonna Titanic upposi?",
    "answer": "1912"
  }
];
async function main() {
  
  await prisma.question.deleteMany();

  for (const quiz of seedQuizs) {
    await prisma.question.create({
      data: {
        question: quiz.question,
        answer: quiz.answer,
      },
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
