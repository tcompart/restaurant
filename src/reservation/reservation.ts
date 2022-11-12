import {hashCode} from "../hashCodeHelper";
import {ReservationDTO} from "./reservation.dto";
import dayjs from "dayjs";
import {PrismaClient} from '.prisma/client'

export interface Reservation {
    at: string;
    email: string;
    name: string;
    quantity: number;
}

export class ReservationController {
    private _repository: ReservationRepository;

    constructor(db: ReservationRepository) {
        this._repository = db;
    }

    post(reservationDTO: ReservationDTO) {
        dayjs.locale('de')
        const dateString = dayjs(new Date(reservationDTO.at)).format('YYYY-MM-DDThh:mm:ss.sssZ');
        this._repository.create(new ReservationImpl(dateString, reservationDTO.email, reservationDTO.name, reservationDTO.quantity))
    }
}



export class ReservationImpl implements Reservation{
    at: string;
    private createdAt: Date;
    email: string;
    name: string;
    quantity: number;

    constructor(at: string, email: string, name: string, quantity: number) {
        this.createdAt = dayjs().toDate();
        this.at = at;
        this.email = email;
        this.name = name;
        this.quantity = quantity;
    }

    get hashcode(): number {
        return hashCode(JSON.stringify(this))
    }
}

export enum Task {
    CompletedTask = "Completed",
    Aborted = "Aborted",
}

const prisma = new PrismaClient()

export class Repository implements ReservationRepository {
    async create(reservation: Reservation): Promise<Task> {
        console.log("Reservation was given ", reservation.at, " ", reservation.email);
        const returns = await prisma.reservation.create({data: reservation});
        return returns ? Task.CompletedTask : Task.Aborted;
    }

}

export interface ReservationRepository {
    create(reservation: Reservation): Promise<Task>
}