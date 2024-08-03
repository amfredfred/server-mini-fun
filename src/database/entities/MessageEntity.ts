import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import 'reflect-metadata'

@Entity({ name: 'chat_messages' })
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @Column()
    content: string;

    @CreateDateColumn()
    timestamp: Date;
}