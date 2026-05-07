import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seedQuizs = [
  {
    id: 1,
    question: "Mikä on Suomen pääkaupunki?",
    answer: "Helsinki",
    date: new Date("2026-05-01"),
    keywords: ["Suomi", "pääkaupunki"],
  },
  {
    id: 2,
    question: "Mikä planeetta tunnetaan 'punaisena planeettana'?",
    answer: "Mars",
    date: new Date("2026-05-04"),
    keywords: ["astronomia", "planeetta"],
  },
  {
    id: 3,
    question: "Kuinka monta bittiä on yhdessä tavussa?",
    answer: "8",
    date: new Date("2026-05-07"),
    keywords: ["tietotekniikka", "bitti"],
  },
  {
    id: 4,
    question: "Kuka maalasi Mona Lisan?",
    answer: "Leonardo da Vinci",
    date: new Date("2026-05-10"),
    keywords: ["taide", "maalaus"],
  },
  {
    id: 5,
    question: "Mikä on maailman suurin valtameri?",
    answer: "Tyyni valtameri",
    date: new Date("2026-05-13"),
    keywords: ["geografia", "valtameri"],
  },
  {
    id: 6,
    question: "Mihin alkuaineeseen kemiallinen merkki 'Au' viittaa?",
    answer: "Kulta",
    date: new Date("2026-05-16"),
    keywords: ["kemia", "alkuaine"],
  },
  {
    id: 7,
    question: "Mikä on luvun 9 neliöjuuri?",
    answer: "3",
    date: new Date("2026-05-19"),
    keywords: ["matematiikka", "neliöjuuri"],
  },
  {
    id: 8,
    question: "Missä maassa sijaitsevat Gizan pyramidit?",
    answer: "Egypti",
    date: new Date("2026-05-22"),
    keywords: ["historia", "pyramidi"],
  },
  {
    id: 9,
    question: "Mikä on ihmiskehon suurin elin?",
    answer: "Iho",
    date: new Date("2026-05-25"),
    keywords: ["biologia", "elin"],
  },
  {
    id: 10,
    question: "Minä vuonna Titanic upposi?",
    answer: "1912",
    date: new Date("2026-05-28"),
    keywords: ["historia", "Titanic"],
  },
];
async function main() {
  // Clear existing data (delete questions first due to foreign key constraints)
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  // Create a default user
  const hashedPassword = await bcrypt.hash("1234", 10);
  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });

  console.log("Created user:", user.email);

  for (const quiz of seedQuizs) {
    await prisma.question.create({
      data: {
        question: quiz.question,
        answer: quiz.answer,
        date: quiz.date,
        keywords: {
          connectOrCreate: quiz.keywords.map((kw) => ({
            where: { name: kw },
            create: { name: kw },
          })),
        },
        userId: user.id,
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
