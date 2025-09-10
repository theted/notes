import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'notes.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH,
  logging: false,
});

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare password_hash: string;
  declare created_at: CreationOptional<string>;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    password_hash: { type: DataTypes.STRING, allowNull: false, unique: true },
    created_at: { type: DataTypes.TEXT, allowNull: false, defaultValue: Sequelize.literal("datetime('now')") },
  },
  { sequelize, tableName: 'users', timestamps: false, underscored: true },
);

export class NoteModel extends Model<InferAttributes<NoteModel>, InferCreationAttributes<NoteModel>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare content: string;
  declare user_id: number;
  declare created_at: CreationOptional<string>;
  declare updated_at: CreationOptional<string>;
}

NoteModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.TEXT, allowNull: false, defaultValue: Sequelize.literal("datetime('now')") },
    updated_at: { type: DataTypes.TEXT, allowNull: false, defaultValue: Sequelize.literal("datetime('now')") },
  },
  {
    sequelize,
    tableName: 'notes',
    timestamps: false,
    underscored: true,
    indexes: [{ fields: ['user_id', 'updated_at'] }],
  },
);

User.hasMany(NoteModel, { foreignKey: 'user_id' });
NoteModel.belongsTo(User, { foreignKey: 'user_id' });

// Ensure updated_at changes on updates (SQLite trigger may not always exist)
NoteModel.beforeUpdate((note) => {
  note.updated_at = new Date().toISOString();
});

export const initDb = async () => {
  await sequelize.sync();

  // Ensure default user exists for backwards-compat with existing env PASSWORD
  const DEFAULT_PASSWORD = process.env.PASSWORD || 'changeme';
  const defaultHash = crypto.createHash('sha256').update(DEFAULT_PASSWORD).digest('hex');
  const [user] = await User.findOrCreate({ where: { password_hash: defaultHash }, defaults: {} });

  // Seed a note if empty
  const count = await NoteModel.count();
  if (count === 0) {
    await NoteModel.create({ title: 'Welcome to Notes', content: 'This is your first note. Start typing!', user_id: user.id });
  }
};
