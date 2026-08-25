import { RoomsService } from '../rooms/rooms.service';
export declare class UpdateRoomStatusDto {
    status: 'approved' | 'rejected';
}
export declare class AdminController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    getAllRoomsForAdmin(): Promise<any>;
    updateRoomStatus(id: number, status: 'approved' | 'rejected'): Promise<any>;
}
