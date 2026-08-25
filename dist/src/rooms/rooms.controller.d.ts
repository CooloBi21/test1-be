import { RoomsService } from './rooms.service';
import { GetRoomsFilterDto } from './dto/get-rooms-filter.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
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
    getRoomById(id: string): Promise<void>;
    createRoom(dto: CreateRoomDto, req: any): any;
    updateRoom(id: string, dto: UpdateRoomDto, req: any): any;
    deleteRoom(id: string, req: any): any;
}
