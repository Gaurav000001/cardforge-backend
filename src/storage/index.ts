import { LocalStorageService } from "./local.storage.js";
import type { StorageService } from "./storage.interface.js";

export const storage: StorageService = new LocalStorageService();
