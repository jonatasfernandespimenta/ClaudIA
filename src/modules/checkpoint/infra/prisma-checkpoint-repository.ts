import { PrismaClient } from '@prisma/client';
import { Checkpoint } from '../domain/entities/checkpoint';
import { CheckpointRepository } from '../domain/repositories/checkpoint-repository';
import { logInfo, logError } from '../../../utils/logger';

export class PrismaCheckpointRepository implements CheckpointRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(checkpoint: Checkpoint): Promise<Checkpoint> {
    logInfo('PrismaCheckpointRepository', 'Starting to save checkpoint', { 
      id: checkpoint.id, 
      projectName: checkpoint.projectName 
    });
    
    try {
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
      
      logInfo('PrismaCheckpointRepository', 'Checkpoint saved successfully', { 
        id: savedCheckpoint.id,
        projectName: savedCheckpoint.projectName
      });

      return new Checkpoint(
        savedCheckpoint.projectName,
        savedCheckpoint.summary,
        savedCheckpoint.createdAt,
        savedCheckpoint.id
      );
    } catch (error) {
      logError('PrismaCheckpointRepository', 'Error saving checkpoint', error as Error, { 
        id: checkpoint.id, 
        projectName: checkpoint.projectName 
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Checkpoint | null> {
    logInfo('PrismaCheckpointRepository', 'Finding checkpoint by ID', { id });
    
    try {
      const checkpoint = await this.prisma.checkpoint.findUnique({
        where: { id },
      });

      if (!checkpoint) {
        logInfo('PrismaCheckpointRepository', 'Checkpoint not found', { id });
        return null;
      }
      
      logInfo('PrismaCheckpointRepository', 'Checkpoint found successfully', { 
        id: checkpoint.id, 
        projectName: checkpoint.projectName 
      });

      return new Checkpoint(
        checkpoint.projectName,
        checkpoint.summary,
        checkpoint.createdAt,
        checkpoint.id
      );
    } catch (error) {
      logError('PrismaCheckpointRepository', 'Error finding checkpoint by ID', error as Error, { id });
      throw error;
    }
  }

  async findAll(): Promise<Checkpoint[]> {
    logInfo('PrismaCheckpointRepository', 'Finding all checkpoints');
    
    try {
      const checkpoints = await this.prisma.checkpoint.findMany({
        orderBy: { createdAt: 'desc' },
      });
      
      logInfo('PrismaCheckpointRepository', 'All checkpoints retrieved successfully', { 
        count: checkpoints.length 
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
    } catch (error) {
      logError('PrismaCheckpointRepository', 'Error finding all checkpoints', error as Error);
      throw error;
    }
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
