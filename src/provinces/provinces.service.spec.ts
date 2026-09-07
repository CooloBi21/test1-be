import { ProvincesService } from './provinces.service';

describe('ProvincesService', () => {
  let service: ProvincesService;

  const mockPrisma = {
    provinces: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new ProvincesService(mockPrisma as any);
  });

  describe('getAllProvinces', () => {
    it('should return all provinces ordered by name', async () => {
      const mockRows = [
        { code: '01', name: 'An Giang' },
        { code: '02', name: 'Bà Rịa - Vũng Tàu' },
      ];

      mockPrisma.provinces.findMany.mockResolvedValueOnce(mockRows);

      const result = await service.getAllProvinces();

      expect(result).toEqual(mockRows);

      expect(mockPrisma.provinces.findMany).toHaveBeenCalledWith({
        select: {
          code: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });
  });
});
