using System;
using System.Collections.Generic;
using System.Linq;

namespace EarlyIslamicQiblas.Models.Extensions; 

public static class EnumerableHelper<E>
{
    private static Random r;

    static EnumerableHelper()
    {
        r = new Random();
    }

    public static T Random<T>(IEnumerable<T> input)
    {
        return input.ElementAt(r.Next(input.Count()));
    }
}

public static class EnumerableExtensions
{
    public static IEnumerable<TSource> DistinctBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)
    {
        HashSet<TKey> seenKeys = new HashSet<TKey>();
        foreach (TSource element in source)
        {
            if (seenKeys.Add(keySelector(element)))
            {
                yield return element;
            }
        }
    }

    public static T Random<T>(this IEnumerable<T> input)
    {
        return EnumerableHelper<T>.Random(input);
    }
}