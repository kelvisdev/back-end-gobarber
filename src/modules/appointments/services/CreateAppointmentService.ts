import { startOfHour } from 'date-fns';
import { getCustomRepository } from 'typeorm';
import AppError from '@shared/errors/AppError';

import Appointment from '../infra/typeorm/entities/Appointment';
import AppointmentsRepository from '../infra/typeorm/repositories/AppointmentsRepository';

/**
 * Recebimento das informações
 * Tratativa de erros/excessões
 * Acesso ao repositório
 */

// Request ou RequestDTO
interface Request {
  provider_id: string;
  date: Date;
}

/**
 * Dependency Inversion
 */

class CreateAppointmentService {
  // execute ou run, basicamente terá apenas um único metodo
  public async execute({ date, provider_id }: Request): Promise<Appointment> {
    const appointmentsRepository = getCustomRepository(AppointmentsRepository);
    const appointmentDate = startOfHour(date);

    const findAppointmentInSameDate = await appointmentsRepository.findByDate(
      appointmentDate,
    );

    if (findAppointmentInSameDate) {
      throw new AppError('This appointment is already booked');
    }

    const appointment = appointmentsRepository.create({
      provider_id,
      date: appointmentDate,
    });

    await appointmentsRepository.save(appointment);

    return appointment;
  }
}

export default CreateAppointmentService;
