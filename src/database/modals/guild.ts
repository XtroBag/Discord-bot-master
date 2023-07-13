import { Schema, model, SchemaTypes } from "mongoose";

export interface GuildData {
  guildName: string;
  id: string;
  prefix: string;
  discussion: {
    channel: string;
    set: boolean;
  };
  logging: {
    name: string;
    channel: string;
    active: boolean;
  };
  applications: [
    {
      name: string;
      channel: string;
      questions?: [];
    }
  ],
  welcome: {
    channel: string;
    prompt: string;
    state: boolean;
    roleIds: string[];

  }
}

export const Guild = model(
  "Guild",
  new Schema<GuildData>({
    guildName: SchemaTypes.String,
    id: SchemaTypes.String,
    prefix: SchemaTypes.String,
    discussion: {
      channel: {
        type: SchemaTypes.String,
        default: "None",
      },
      set: SchemaTypes.Boolean,
    },
    logging: {
      name: SchemaTypes.String,
      channel: SchemaTypes.String,
      active: {
        type: SchemaTypes.Boolean,
        default: false,
      },
    },
    applications: [
      {
        name: { 
          type: SchemaTypes.String,
          default: "None"
        },
        channel: {
          type: SchemaTypes.String,
          default: "None"
        },
        questions: SchemaTypes.Array
      }
    ],
    welcome: {
      channel: {
        type: SchemaTypes.String,
        default: 'None',
      },
      prompt: {
        type: SchemaTypes.String,
        default: 'None'
      },
      state: {
        type: SchemaTypes.Boolean,
        default: false
      },
      roleIds: SchemaTypes.Array
    }
  })
);
