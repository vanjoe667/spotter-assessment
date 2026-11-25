from rest_framework import serializers


class RouteRequestSerializer(serializers.Serializer):
    origin = serializers.CharField(max_length=255)
    destination = serializers.CharField(max_length=255)
    departure_datetime = serializers.DateTimeField()
    load_weight = serializers.FloatField(min_value=0)


class WeatherDataSerializer(serializers.Serializer):
    wind_mph = serializers.FloatField()
    rain_in_hr = serializers.FloatField()
    snow_in_hr = serializers.FloatField()


class CheckpointSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lng = serializers.FloatField()
    distance_miles = serializers.FloatField()
    eta_iso = serializers.CharField()
    risk_level = serializers.CharField()
    risk_score = serializers.IntegerField()
    weather = WeatherDataSerializer()


class RiskSummarySerializer(serializers.Serializer):
    low = serializers.IntegerField()
    moderate = serializers.IntegerField()
    high = serializers.IntegerField()
    severe = serializers.IntegerField()
    no_travel = serializers.IntegerField()


class RouteSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    distance_miles = serializers.FloatField()
    duration_hours = serializers.FloatField()
    geometry = serializers.ListField(child=serializers.ListField(child=serializers.FloatField()))
    checkpoints = CheckpointSerializer(many=True)
    risk_summary = RiskSummarySerializer()
    severe_miles = serializers.FloatField()
    high_miles = serializers.FloatField()
    avg_risk_score = serializers.FloatField()


class RouteResponseSerializer(serializers.Serializer):
    routes = RouteSerializer(many=True)
    recommended_route_index = serializers.IntegerField()
