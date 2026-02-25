import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  private readonly secret = process.env.PASSWORD_SECRET ?? '';

  hash(raw: string): Promise<string> {
    return bcrypt.hash(raw + this.secret, 10);
  }

  compare(raw: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(raw + this.secret, hashed);
  }
}
