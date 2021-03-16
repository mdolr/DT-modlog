import { IsOptional, IsString } from 'class-validator';
import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class DiscordServer {
  @PrimaryColumn({ name: 'id', type: 'varchar' })
  @IsString()
  id: string;

  @Column({ name: 'prefix', type: 'varchar' })
  @IsString()
  prefix: string;

  @Column({ name: 'twitch_id', type: 'varchar', nullable: true })
  @Index({ unique: false })
  @IsString()
  @IsOptional()
  twitchID: string;

  @Column({ name: 'twitch_name', type: 'varchar', nullable: true })
  @IsString()
  @IsOptional()
  twitchName: string;

  @Column('text', { name: 'events_channel_moderation', array: true })
  @IsOptional()
  moderationEventsChannel: string[];

  @Column('text', { name: 'events_channel_chat', array: true })
  @IsOptional()
  chatEventsChannel: string[];

  @Column('text', { name: 'events_channel_role', array: true })
  @IsOptional()
  roleEventsChannel: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', precision: 0 })
  joinedAt: Date;

  constructor(
    id: string,
    prefix: string,
    twitchID: string,
    twitchName: string,
    moderationEventsChannel: string[],
    chatEventsChannel: string[],
    roleEventsChannel: string[],
  ) {
    this.id = id;
    this.prefix = prefix;

    this.twitchID = twitchID;
    this.twitchName = twitchName;

    this.moderationEventsChannel = moderationEventsChannel;
    this.chatEventsChannel = chatEventsChannel;
    this.roleEventsChannel = roleEventsChannel;
  }
}
