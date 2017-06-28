package sample;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.BeforeClass;

import sample.HelloWorld;

/**
 * Tests for {@link Foo}.
 *
 * @author user@example.com (John Doe)
 */
public class HelloWorldRealTest {

    private static HelloWorld hw = null;

    @BeforeClass
    public static void setup() {
        hw = new HelloWorld();
    }
    
    @Test
    public void testAdd1() {
       assertEquals( hw.add(1,1),2);
    }

    @Test
    public void testAdd2() {
       assertEquals( hw.add(3,3),6);
    }

    @Test
    public void testAdd3() {
       assertEquals( hw.add(2,2),4);
    }
}
