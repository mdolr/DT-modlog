import { IsInt, IsOptional, IsString } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class DiscordServer {
  @PrimaryColumn({ name: 'id', type: 'varchar' })
  @IsString()
  id: string;

  @Column({ name: 'prefix', type: 'varchar' })
  @IsString()
  prefix: string;

  @Column({ name: 'case_id', type: 'int' })
  @IsInt()
  caseID: number;

  @Column({ name: 'twitch_id', type: 'varchar', nullable: true })
  @Index({ unique: false })
  @IsString()
  @IsOptional()
  twitchID: string;

  @Column({ name: 'twitch_name', type: 'varchar', nullable: true })
  @IsString()
  @IsOptional()
  twitchName: string;

  @Column({ name: 'events_channel_moderation', type: 'varchar', nullable: true })
  @IsString()
  @IsOptional()
  moderationEventsChannel: string;

  @Column({ name: 'events_channel_chat', type: 'varchar', nullable: true })
  @IsString()
  @IsOptional()
  chatEventsChannel: string;

  @Column({ name: 'events_channel_role', type: 'varchar', nullable: true })
  @IsString()
  @IsOptional()
  roleEventsChannel: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 0 })
  joinedAt: Date;

  constructor(
    id: string,
    prefix: string = '?',
    twitchID: string,
    twitchName: string,
    moderationEventsChannel: string,
    chatEventsChannel: string,
    roleEventsChannel: string,
    caseID: number = 1,
  ) {
    this.id = id;
    this.prefix = prefix;

    this.twitchID = twitchID;
    this.twitchName = twitchName;

    this.moderationEventsChannel = moderationEventsChannel;
    this.chatEventsChannel = chatEventsChannel;
    this.roleEventsChannel = roleEventsChannel;

    this.caseID = caseID;
  }
}
