import org.flywaydb.core.api.resource.LoadableResource;
import org.flywaydb.core.internal.resource.filesystem.FileSystemResource;
import org.flywaydb.core.internal.resolver.ChecksumCalculator;

import java.nio.file.Path;
import java.nio.file.Paths;

public class ChecksumTest {
    public static void main(String[] args) throws Exception {
        Path path = Paths.get("../V1_lf.sql");
        FileSystemResource resource = new FileSystemResource(null, path.toAbsolutePath().toString(), java.nio.charset.StandardCharsets.UTF_8, false);
        int checksum = ChecksumCalculator.calculate(resource);
        System.out.println("Checksum of current file: " + checksum);
    }
}
