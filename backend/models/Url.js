import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Url = sequelize.define("Url", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  shortUrl: {
    type: DataTypes.STRING(10),
    unique: true,
    allowNull: false,
  },
  longUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  clickCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  clickTimestamps: {
    type: DataTypes.ARRAY(DataTypes.DATE),
    defaultValue: [],
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Url;
