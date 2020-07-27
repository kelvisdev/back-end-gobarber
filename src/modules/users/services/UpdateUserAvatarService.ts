import path from 'path';
import fs from 'fs';
import AppError from '@shared/errors/AppError';

import uploadConfig from '@config/upload';
import { injectable, inject } from 'tsyringe';

import User from '../infra/typeorm/entities/User';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  user_id: string;
  avatarFilename: string;
}

@injectable()
class UpdateUserAvatarService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({ user_id, avatarFilename }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar.', 401);
    }

    if (user.avatar) {
      // Deletar avatar anterior
      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);
      // TODO - Tratar quando existir o caminho no banco mas não existir o mesmso arquivo no diretório
      const userAvatarFileExistes = await fs.promises.stat(userAvatarFilePath);

      if (userAvatarFileExistes) {
        await fs.promises.unlink(userAvatarFilePath); // deleta imagems
      }
    }

    user.avatar = avatarFilename;

    await this.usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
