import prisma from "../lib/prisma.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";

async function isOwner (req, res, next) {
    const id = Number(req.params.qid);
    const question = await prisma.question.findUnique({
      where: { id },
      include: { keywords: true },
    });

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (question.userId !== req.user.userId) {
      throw new ForbiddenError("You can only modify your own questions");
    }

    // Attach the record to the request so the route handler can reuse it
    req.question = question;
    next();

}

export default isOwner;
