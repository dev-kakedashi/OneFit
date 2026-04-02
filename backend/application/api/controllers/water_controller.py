from datetime import date

from common.errors.errors import WaterErrors
from common.errors.exceptions import NotFoundException
from schemas.request.water_request import WaterLogCreateRequest, WaterLogUpdateRequest
from schemas.response.water_response import WaterLogResponse
from service.water_service import WaterService
from sqlalchemy.orm import Session


class WaterController:
    @staticmethod
    def get_water_logs(db: Session, target_date: date) -> list[WaterLogResponse]:
        return WaterService.get_water_logs(db, target_date)

    @staticmethod
    def create_water_log(
        db: Session,
        request: WaterLogCreateRequest,
    ) -> WaterLogResponse:
        return WaterService.create_water_log(db, request)

    @staticmethod
    def update_water_log(
        db: Session,
        water_log_id: int,
        request: WaterLogUpdateRequest,
    ) -> WaterLogResponse:
        water_log = WaterService.update_water_log(db, water_log_id, request)
        if water_log is None:
            raise NotFoundException(WaterErrors.NOT_FOUND_FOR_UPDATE)
        return water_log

    @staticmethod
    def delete_water_log(db: Session, water_log_id: int) -> None:
        deleted = WaterService.delete_water_log(db, water_log_id)
        if not deleted:
            raise NotFoundException(WaterErrors.NOT_FOUND_FOR_DELETE)
