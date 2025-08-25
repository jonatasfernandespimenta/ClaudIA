import { PrismaClient } from '@prisma/client';
import { Checkpoint } from '../domain/entities/checkpoint';
import { CheckpointRepository } from '../domain/repositories/checkpoint-repository';

export class PrismaCheckpointRepository implements CheckpointRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(checkpoint: Checkpoint): Promise<Checkpoint> {
    const data = {
      id: checkpoint.id!,
      projectName: checkpoint.projectName,
      summary: checkpoint.summary,
      createdAt: checkpoint.createdAt,
    };

    const savedCheckpoint = await this.prisma.checkpoint.upsert({
      where: { id: checkpoint.id! },
      update: data,
      create: data,
    });

    return new Checkpoint(
      savedCheckpoint.projectName,
      savedCheckpoint.summary,
      savedCheckpoint.createdAt,
      savedCheckpoint.id
    );
  }

  async findById(id: string): Promise<Checkpoint | null> {
    const checkpoint = await this.prisma.checkpoint.findUnique({
      where: { id },
    });

    if (!checkpoint) {
      return null;
    }

    return new Checkpoint(
      checkpoint.projectName,
      checkpoint.summary,
      checkpoint.createdAt,
      checkpoint.id
    );
  }

  async findAll(): Promise<Checkpoint[]> {
    const checkpoints = await this.prisma.checkpoint.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return checkpoints.map(
      (checkpoint: any) =>
        new Checkpoint(
          checkpoint.projectName,
          checkpoint.summary,
          checkpoint.createdAt,
          checkpoint.id
        )
    );
  }

  async findByProjectName(projectName: string): Promise<Checkpoint[]> {
    const checkpoints = await this.prisma.checkpoint.findMany({
      where: { projectName },
      orderBy: { createdAt: 'desc' },
    });

    return checkpoints.map(
      (checkpoint: any) =>
        new Checkpoint(
          checkpoint.projectName,
          checkpoint.summary,
          checkpoint.createdAt,
          checkpoint.id
        )
    );
  }

  async findAllCheckpointsSince(date: Date): Promise<Checkpoint[]> {
    const checkpoints = await this.prisma.checkpoint.findMany({
      where: {
        createdAt: {
          gte: date,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return checkpoints.map(
      (checkpoint: any) =>
        new Checkpoint(
          checkpoint.projectName,
          checkpoint.summary,
          checkpoint.createdAt,
          checkpoint.id
        )
    );
  }
}
