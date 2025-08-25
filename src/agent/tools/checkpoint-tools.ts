import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { 
  createCheckpointToolSchema,
  findCheckpointByIdToolSchema,
  findCheckpointsByProjectNameToolSchema,
  findAllCheckpointsSinceToolSchema,
  findAllCheckpointsToolSchema
} from "./checkpoint-schemas";

import { CheckpointRepository } from "../../modules/checkpoint/domain/repositories/checkpoint-repository";
import { PrismaCheckpointRepository } from "../../modules/checkpoint/infra/prisma-checkpoint-repository";
import { CreateCheckpointUseCase } from "../../modules/checkpoint/app/use-cases/create-checkpoint-use-case";
import { FindAllCheckpointsUseCase } from "../../modules/checkpoint/app/use-cases/find-all-checkpoints-use-case";
import { FindCheckpointByIdUseCase } from "../../modules/checkpoint/app/use-cases/find-checkpoint-by-id-use-case";
import { FindCheckpointsByProjectNameUseCase } from "../../modules/checkpoint/app/use-cases/find-checkpoints-by-project-name-use-case";
import { FindAllCheckpointsSinceUseCase } from "../../modules/checkpoint/app/use-cases/find-all-checkpoints-since-use-case";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const checkpointRepository: CheckpointRepository = new PrismaCheckpointRepository(prisma);

export const createCheckpointTool = tool(
  async (input) => {
    const createCheckpoint = new CreateCheckpointUseCase(checkpointRepository);
    const result = await createCheckpoint.execute(input as z.infer<typeof createCheckpointToolSchema>);
    return result;
  },
  {
    name: "create_checkpoint",
    description: "Create a checkpoint for a project with a summary of what was accomplished",
    schema: createCheckpointToolSchema
  }
);

export const findAllCheckpointsTool = tool(
  async () => {
    const findAllCheckpoints = new FindAllCheckpointsUseCase(checkpointRepository);
    const result = await findAllCheckpoints.execute();
    return JSON.stringify(result, null, 2);
  },
  {
    name: "find_all_checkpoints",
    description: "Retrieve all checkpoints from all projects, ordered by creation date (newest first)",
    schema: findAllCheckpointsToolSchema
  }
);

export const findCheckpointByIdTool = tool(
  async (input) => {
    const findCheckpointById = new FindCheckpointByIdUseCase(checkpointRepository);
    const result = await findCheckpointById.execute(input as z.infer<typeof findCheckpointByIdToolSchema>);
    return JSON.stringify(result, null, 2);
  },
  {
    name: "find_checkpoint_by_id",
    description: "Find a specific checkpoint by its unique identifier",
    schema: findCheckpointByIdToolSchema
  }
);

export const findCheckpointsByProjectNameTool = tool(
  async (input) => {
    const findCheckpointsByProjectName = new FindCheckpointsByProjectNameUseCase(checkpointRepository);
    const result = await findCheckpointsByProjectName.execute(input as z.infer<typeof findCheckpointsByProjectNameToolSchema>);
    return JSON.stringify(result, null, 2);
  },
  {
    name: "find_checkpoints_by_project_name",
    description: "Find all checkpoints for a specific project, ordered by creation date (newest first)",
    schema: findCheckpointsByProjectNameToolSchema
  }
);

export const findAllCheckpointsSinceTool = tool(
  async (input) => {
    const { date } = input as z.infer<typeof findAllCheckpointsSinceToolSchema>;
    const findAllCheckpointsSince = new FindAllCheckpointsSinceUseCase(checkpointRepository);
    const result = await findAllCheckpointsSince.execute({ date: new Date(date) });
    return JSON.stringify(result, null, 2);
  },
  {
    name: "find_all_checkpoints_since",
    description: "Find all checkpoints created since a specific date, with date range information",
    schema: findAllCheckpointsSinceToolSchema
  }
);

export const checkpointTools = [
  createCheckpointTool,
  findAllCheckpointsTool,
  findCheckpointByIdTool,
  findCheckpointsByProjectNameTool,
  findAllCheckpointsSinceTool
];
