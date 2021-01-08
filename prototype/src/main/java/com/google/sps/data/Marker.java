/** Represents a marker on the map. */
public class Marker {

	private final double lat;
	private final double lng;
	private final String content;

	public Marker(double lat, double lng, String content) {
		this.lat = lat;
		this.lng = lng;
		this.content = content;
	}

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }

    public String getContent() {
        return content;
    }
}