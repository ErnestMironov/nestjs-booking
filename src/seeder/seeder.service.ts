import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Workshop } from '../entities/workshop.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedWorkshops();
  }

  private async seedAdmin() {
    const exists = await this.userRepo.findOne({
      where: { email: 'admin@test.com' },
    });
    if (exists) return;

    const password_hash = await bcrypt.hash('secret123', 10);
    await this.userRepo.save(
      this.userRepo.create({
        email: 'admin@test.com',
        password_hash,
        role: 'admin',
      }),
    );
  }

  private async seedWorkshops() {
    const count = await this.workshopRepo.count();
    if (count > 0) return;

    const workshops = [
      {
        title: 'Гончарное дело для начинающих',
        description:
          'Научитесь лепить из глины на гончарном круге. Материалы и инструменты предоставляются. Каждый участник унесёт домой готовое изделие.',
        date: new Date('2026-06-20T10:00:00Z'),
        capacity: 12,
        imageUrl:
          'https://images.unsplash.com/photo-1764507768797-5b7de6eedcb7?w=900&h=300&fit=crop&auto=format',
      },
      {
        title: 'Акварельная живопись',
        description:
          'Мастер-класс по акварели для тех, кто хочет научиться писать пейзажи и натюрморты. Все расходники включены в стоимость.',
        date: new Date('2026-06-25T14:00:00Z'),
        capacity: 8,
        imageUrl:
          'https://images.unsplash.com/photo-1578961140619-896df05b1fd2?w=900&h=300&fit=crop&auto=format',
      },
      {
        title: 'Кожаные изделия своими руками',
        description:
          'Создадим кошелёк или брелок из натуральной кожи. Вы освоите базовые техники шитья и тиснения по коже.',
        date: new Date('2026-07-05T11:00:00Z'),
        capacity: 6,
        imageUrl:
          'https://images.unsplash.com/photo-1573227897444-860137a0fe74?w=900&h=300&fit=crop&auto=format',
      },
      {
        title: 'Флористика и составление букетов',
        description:
          'Научитесь составлять букеты и флористические композиции. Свежие цветы и материалы предоставляются.',
        date: new Date('2026-07-12T15:00:00Z'),
        capacity: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=900&h=300&fit=crop&auto=format',
      },
      {
        title: 'Столярное дело: разделочная доска',
        description:
          'Сделаете разделочную доску из массива дерева с нуля. Весь инструмент и дерево предоставляется.',
        date: new Date('2026-07-20T10:00:00Z'),
        capacity: 5,
        imageUrl:
          'https://images.unsplash.com/photo-1631396328075-9c65a7406f09?w=900&h=300&fit=crop&auto=format',
      },
    ];

    await this.workshopRepo.save(
      workshops.map((w) => this.workshopRepo.create(w)),
    );
  }
}
