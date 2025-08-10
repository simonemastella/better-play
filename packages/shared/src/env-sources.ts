import * as fs from 'fs';

export interface EnvSource {
  name: string;
  load(): Record<string, any>;
}

export function envVarsSource(): EnvSource {
  return {
    name: 'process.env',
    load: () => process.env
  };
}

export function jsonFileSource(filePath: string): EnvSource {
  return {
    name: `json:${filePath}`,
    load: () => {
      try {
        if (!fs.existsSync(filePath)) return {};
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      } catch {
        return {};
      }
    }
  };
}

export function dotEnvSource(filePath: string = '.env'): EnvSource {
  return {
    name: `dotenv:${filePath}`,
    load: () => {
      try {
        if (!fs.existsSync(filePath)) return {};
        const content = fs.readFileSync(filePath, 'utf-8');
        const result: Record<string, string> = {};
        
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          
          const [key, ...valueParts] = trimmed.split('=');
          if (!key) return;
          
          let value = valueParts.join('=').trim();
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          result[key.trim()] = value;
        });
        
        return result;
      } catch {
        return {};
      }
    }
  };
}
