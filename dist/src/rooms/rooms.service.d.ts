import { Pool } from 'pg';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { CreateRoomDto } from './dto/create-room.dto';
export declare class RoomsService {
    private readonly pool;
    constructor(pool: Pool);
    getRooms(filterDto: GetRoomsFilterDto): Promise<{
        total: number;
        data: any[];
    }>;
    getRoomById(id: string): Promise<any>;
    createRoom(dto: CreateRoomDto): Promise<any>;
    updateRoom(id: string, dto: CreateRoomDto): Promise<any>;
    deleteRoom(id: string): Promise<{
        message: string;
        data: any;
    }>;
}
