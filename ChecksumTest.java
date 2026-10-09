import org.flywaydb.core.internal.resource.filesystem.FileSystemResource;
import org.flywaydb.core.internal.resolver.ChecksumCalculator;
public class ChecksumTest {
    public static void main(String[] args) throws Exception {
        FileSystemResource resource = new FileSystemResource(null, "V1_94_lines.sql", java.nio.charset.StandardCharsets.UTF_8, false);
        System.out.println("Checksum of V1_94_lines.sql: " + ChecksumCalculator.calculate(resource));
    }
}
