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
    getRoomById(id: string): Promise<any>;
    createRoom(dto: CreateRoomDto, req: any): Promise<any>;
    updateRoom(id: string, dto: UpdateRoomDto, req: any): Promise<{
        data: any;
        changes: {
            field: string;
            oldValue: any;
            newValue: any;
        }[];
    }>;
    deleteRoom(id: string, req: any): Promise<{
        message: string;
        data: any;
    }>;
}
