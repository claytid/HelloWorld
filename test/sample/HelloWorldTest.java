package sample;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Ignore;
import org.junit.Test;

/**
 * Tests for {@link Foo}.
 *
 * @author user@example.com (John Doe)
 */
public class HelloWorldTest {
    
    @Test
    public void thisAlwaysFails() {
       fail("This is the end!");
       // assertTrue(true);
    }

    @Test
    public void thisAlwaysPasses() {
        assertTrue(true);
    }

    @Test
    @Ignore
    public void thisIsIgnored() {
    }
}
