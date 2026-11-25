from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..schemas.route_schemas import RouteRequestSerializer
from ..services import geocoding_service, routing_service, weather_service
from ..services.risk_engine import (
    classify_checkpoint,
    score_route,
    build_risk_summary,
    recommend_route,
    RISK_SCORES,
)


class RouteView(APIView):
    def post(self, request):
        serializer = RouteRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        load_weight = data["load_weight"]
        departure_dt = data["departure_datetime"]

        try:
            origin_coords = geocoding_service.geocode(data["origin"])
            destination_coords = geocoding_service.geocode(data["destination"])
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except Exception:
            return Response(
                {"error": "Geocoding failed. Check your ORS API key."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        try:
            routes = routing_service.get_routes(origin_coords, destination_coords, departure_dt)
        except Exception:
            return Response(
                {"error": "Routing failed. Check your ORS API key and locations."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        enriched_routes = []
        for route in routes:
            enriched_checkpoints = []
            for cp in route["checkpoints"]:
                try:
                    weather = weather_service.get_weather_at_checkpoint(
                        cp["lat"], cp["lng"], cp["eta_iso"]
                    )
                except Exception:
                    weather = {"wind_mph": 0.0, "rain_in_hr": 0.0, "snow_in_hr": 0.0}

                risk_level = classify_checkpoint(weather, load_weight)
                enriched_checkpoints.append({
                    **cp,
                    "weather": weather,
                    "risk_level": risk_level.value,
                    "risk_score": RISK_SCORES[risk_level],
                })

            scores = score_route(enriched_checkpoints, route["duration_hours"])
            risk_summary = build_risk_summary(enriched_checkpoints)

            enriched_routes.append({
                **route,
                "checkpoints": enriched_checkpoints,
                "risk_summary": risk_summary,
                **scores,
            })

        recommended_index = recommend_route(enriched_routes)

        return Response({
            "routes": enriched_routes,
            "recommended_route_index": recommended_index,
        })
