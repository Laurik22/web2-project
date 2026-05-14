
import prisma from "../src/lib/prisma.js";
import app from "../src/app.js";
import request from "supertest";

async function resetDb() {
  await prisma.attempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.keyword.deleteMany();
  await prisma.user.deleteMany();
}

async function registerAndLogin(email = "a@test.io", name = "A") {
  await request(app).post("/api/auth/register")
    .send({ email, password: "pw12345", name });
  const res = await request(app).post("/api/auth/login")
    .send({ email, password: "pw12345" });
  return res.body.token;
}

async function createQuestion(token, overrides = {}) {
  const res = await request(app).post("/api/questions")
    .set("Authorization", `Bearer ${token}`)
    .send({ question: "Q", createdAt: "2026-01-01", answer: "A", ...overrides });
  return res.body;
}

export { resetDb, registerAndLogin, createQuestion, request, app, prisma };

