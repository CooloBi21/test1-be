import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRoomDto } from './create-room.dto';

describe('CreateRoomDto', () => {
  const createValidDto = () => ({
    title: 'Phòng trọ test',
    price: 2500000,
    area: 25,
    city: '79',
    district: '760',
  });

  it('should accept valid price and area', async () => {
    const dto = plainToInstance(CreateRoomDto, {
      ...createValidDto(),
      price: 2500000,
      area: 25,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject price equal to 0', async () => {
    const dto = plainToInstance(CreateRoomDto, {
      ...createValidDto(),
      price: 0,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'price')).toBe(true);
  });

  it('should reject negative price', async () => {
    const dto = plainToInstance(CreateRoomDto, {
      ...createValidDto(),
      price: -100000,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'price')).toBe(true);
  });

  it('should reject area equal to 0', async () => {
    const dto = plainToInstance(CreateRoomDto, {
      ...createValidDto(),
      area: 0,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'area')).toBe(true);
  });

  it('should reject negative area', async () => {
    const dto = plainToInstance(CreateRoomDto, {
      ...createValidDto(),
      area: -10,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'area')).toBe(true);
  });
});
