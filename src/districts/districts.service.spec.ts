import { DistrictsService } from './districts.service';

describe('DistrictsService', () => {
  let service: DistrictsService;

  const supabase = {
    from: jest.fn(),
  };

  const db = {
    supabase,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DistrictsService(db as any);
  });

  describe('getAllDistricts', () => {
    it('should return all districts', async () => {
      const districts = [
        {
          code: '01',
          name: 'District A',
          parent_code: '01',
        },
        {
          code: '02',
          name: 'District B',
          parent_code: '01',
        },
      ];

      const select = jest.fn().mockResolvedValue({
        data: districts,
        error: null,
      });

      supabase.from.mockReturnValue({
        select,
      });

      const result = await service.getAllDistricts();

      expect(supabase.from).toHaveBeenCalledWith('districts');
      expect(select).toHaveBeenCalledWith('*');
      expect(result).toEqual(districts);
    });

    it('should throw the Supabase error when fetching all districts fails', async () => {
      const error = new Error('Supabase query failed');

      const select = jest.fn().mockResolvedValue({
        data: null,
        error,
      });

      supabase.from.mockReturnValue({
        select,
      });

      await expect(service.getAllDistricts()).rejects.toBe(error);

      expect(supabase.from).toHaveBeenCalledWith('districts');
      expect(select).toHaveBeenCalledWith('*');
    });
  });

  describe('getDistrictsByProvince', () => {
    it('should return an empty array when parentCode is empty', async () => {
      const result = await service.getDistrictsByProvince('');

      expect(result).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should return an empty array when parentCode is "undefined"', async () => {
      const result = await service.getDistrictsByProvince('undefined');

      expect(result).toEqual([]);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should query both raw and padded parent codes', async () => {
      const districts = [
        {
          code: '101',
          name: 'District A',
          parent_code: '1',
        },
        {
          code: '102',
          name: 'District B',
          parent_code: '01',
        },
      ];

      const order = jest.fn().mockResolvedValue({
        data: districts,
        error: null,
      });

      const inMethod = jest.fn().mockReturnValue({
        order,
      });

      const select = jest.fn().mockReturnValue({
        in: inMethod,
      });

      supabase.from.mockReturnValue({
        select,
      });

      const result = await service.getDistrictsByProvince('1');

      expect(supabase.from).toHaveBeenCalledWith('districts');
      expect(select).toHaveBeenCalledWith('*');
      expect(inMethod).toHaveBeenCalledWith('parent_code', ['1', '01']);
      expect(order).toHaveBeenCalledWith('name', {
        ascending: true,
      });
      expect(result).toEqual(districts);
    });

    it('should not create duplicate parent codes when the input is already padded', async () => {
      const districts = [
        {
          code: '101',
          name: 'District A',
          parent_code: '01',
        },
      ];

      const order = jest.fn().mockResolvedValue({
        data: districts,
        error: null,
      });

      const inMethod = jest.fn().mockReturnValue({
        order,
      });

      const select = jest.fn().mockReturnValue({
        in: inMethod,
      });

      supabase.from.mockReturnValue({
        select,
      });

      const result = await service.getDistrictsByProvince('01');

      expect(inMethod).toHaveBeenCalledWith('parent_code', ['01']);
      expect(result).toEqual(districts);
    });

    it('should trim whitespace from parentCode before querying', async () => {
      const districts = [
        {
          code: '101',
          name: 'District A',
          parent_code: '1',
        },
      ];

      const order = jest.fn().mockResolvedValue({
        data: districts,
        error: null,
      });

      const inMethod = jest.fn().mockReturnValue({
        order,
      });

      const select = jest.fn().mockReturnValue({
        in: inMethod,
      });

      supabase.from.mockReturnValue({
        select,
      });

      const result = await service.getDistrictsByProvince(' 1 ');

      expect(inMethod).toHaveBeenCalledWith('parent_code', ['1', '01']);
      expect(result).toEqual(districts);
    });

    it('should return an empty array when Supabase returns no data', async () => {
      const order = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const inMethod = jest.fn().mockReturnValue({
        order,
      });

      const select = jest.fn().mockReturnValue({
        in: inMethod,
      });

      supabase.from.mockReturnValue({
        select,
      });

      const result = await service.getDistrictsByProvince('1');

      expect(result).toEqual([]);
    });

    it('should return districts ordered by name ascending', async () => {
      const districts = [
        {
          code: '102',
          name: 'District B',
          parent_code: '01',
        },
        {
          code: '101',
          name: 'District A',
          parent_code: '01',
        },
      ];

      const order = jest.fn().mockResolvedValue({
        data: districts,
        error: null,
      });

      const inMethod = jest.fn().mockReturnValue({
        order,
      });

      const select = jest.fn().mockReturnValue({
        in: inMethod,
      });

      supabase.from.mockReturnValue({
        select,
      });

      const result = await service.getDistrictsByProvince('1');

      expect(order).toHaveBeenCalledWith('name', {
        ascending: true,
      });
      expect(result).toEqual(districts);
    });

    it('should throw the Supabase error when filtering districts fails', async () => {
      const error = new Error('District query failed');

      const order = jest.fn().mockResolvedValue({
        data: null,
        error,
      });

      const inMethod = jest.fn().mockReturnValue({
        order,
      });

      const select = jest.fn().mockReturnValue({
        in: inMethod,
      });

      supabase.from.mockReturnValue({
        select,
      });

      await expect(
        service.getDistrictsByProvince('1'),
      ).rejects.toBe(error);

      expect(inMethod).toHaveBeenCalledWith('parent_code', ['1', '01']);
      expect(order).toHaveBeenCalledWith('name', {
        ascending: true,
      });
    });
  });
});
