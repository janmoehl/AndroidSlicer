package org.unibremen.mcyl.androidslicer.util;

import java.util.Objects;

/**
 * Simple Pair Implementation, with values stored in attributes one and two
 * @param <T> type of value one
 * @param <S> type of value two
 */
public class Pair<T,S> {
    public T one;
    public S two;

    public Pair(){};

    public Pair(T one, S two) {
        this.one = one;
        this.two = two;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Pair)
            return false;
        Pair other = (Pair) obj;
        return Objects.equals(this.one, other.one) && Objects.equals(this.two, other.two);
    }
}
