import { RoomsService } from './rooms.service';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { CreateRoomDto } from './dto/create-room.dto';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    getRooms(filterDto: GetRoomsFilterDto): Promise<{
        total: number;
        data: any[];
    }>;
    getMyRooms(req: any): Promise<{
        total: number;
        data: any[];
    }>;
    getRoomById(id: string): Promise<any>;
    createRoom(dto: CreateRoomDto, req: any): Promise<any>;
    updateRoom(id: string, dto: CreateRoomDto): Promise<any>;
    deleteRoom(id: string): Promise<{
        message: string;
        data: any;
    }>;
}
