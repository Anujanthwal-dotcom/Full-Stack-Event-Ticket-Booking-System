import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundException } from '../common/entity-not-found.exception';
import { AccessDeniedException } from '../common/access-denied.exception';
import { SeatUnavailableException } from '../common/seat-unavailable.exception';
import { PaymentException } from '../common/payment.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof EntityNotFoundException) {
      response.status(HttpStatus.NOT_FOUND).json({ error: exception.message });
      return;
    }

    if (exception instanceof AccessDeniedException) {
      response.status(HttpStatus.FORBIDDEN).json({ error: exception.message });
      return;
    }

    if (exception instanceof SeatUnavailableException) {
      response.status(HttpStatus.CONFLICT).json({ error: exception.message });
      return;
    }

    if (exception instanceof PaymentException) {
      response
        .status(HttpStatus.PAYMENT_REQUIRED)
        .json({ error: exception.message });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();
      if (typeof resp === 'object' && resp !== null) {
        response.status(status).json(resp);
      } else {
        response.status(status).json({ error: resp });
      }
      return;
    }

    if (
      exception instanceof Error &&
      exception.name === 'ValidationError'
    ) {
      response.status(HttpStatus.BAD_REQUEST).json({ error: exception.message });
      return;
    }

    if (exception instanceof Error) {
      console.error('Unhandled exception:', exception);
    }

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'An unexpected error occurred' });
  }
}
